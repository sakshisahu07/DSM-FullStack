const fs = require('fs');

const filePath = 'app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Imports
const imports = `import { useDispatch } from 'react-redux';
import { fetchAddresses, createAddress } from '@/redux/slices/addressSlice';
import { createOrder, verifyPayment } from '@/redux/slices/orderSlice';
import { clearCart } from '@/redux/slices/cartSlice';
import toast from 'react-hot-toast';

// Add razorpay types globally
declare global {
  interface Window {
    Razorpay: any;
  }
}
`;
content = content.replace("import { useSelector } from 'react-redux';", "import { useSelector, useDispatch } from 'react-redux';\n" + imports);

// 2. Add dispatch and address states
const hooks = `    const dispatch = useDispatch<any>();
    const { addresses } = useSelector((state: RootState) => state.address);
    const { currentOrder, loading: orderLoading } = useSelector((state: RootState) => state.order);

    // Contact form state
    const [contactData, setContactData] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        phone: '',
        firstName: '',
        lastName: '',
        email: ''
    });
    const [saveAddress, setSaveAddress] = useState(true);

    useEffect(() => {
        if (token) {
            dispatch(fetchAddresses());
        }
    }, [token, dispatch]);

    // Load Razorpay Script
    useEffect(() => {
        const loadScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadScript();
    }, []);
`;

content = content.replace("    const [isSuccess, setIsSuccess] = useState(false);", "    const [isSuccess, setIsSuccess] = useState(false);\n" + hooks);

// 3. Handle Continue Logic
const oldContinue = `    const handleContinue = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else if (currentStep === steps.length - 1) {
            setIsSuccess(true);
        }
    };`;

const newContinue = `    const handleContinue = async () => {
        if (currentStep === 1) {
            // Validate and save address if checked
            if (!contactData.street) {
                toast.error('Address is required');
                return;
            }
            if (saveAddress) {
                try {
                    await dispatch(createAddress({
                        street: \`\${contactData.firstName} \${contactData.lastName}, \${contactData.street}, \${contactData.city}, \${contactData.state}, \${contactData.country} - \${contactData.pincode}. Ph: \${contactData.phone}\`
                    })).unwrap();
                } catch(e: any) {
                    toast.error('Failed to save address');
                }
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!addresses || addresses.length === 0) {
                if (!contactData.street) {
                    toast.error('Please add an address in Contact step');
                    return setCurrentStep(1);
                }
            }
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // Final Checkout
            const paymentMap: any = {
                'upi': 'ONLINE',
                'cards': 'ONLINE',
                'cod': 'COD'
            };
            const method = paymentMap[selectedPayment] || 'ONLINE';
            const shipping = selectedShipping === 'air' ? 'air' : 'road';
            
            let addressPayload = null;
            if (addresses && addresses.length > 0 && selectedAddress < addresses.length) {
                addressPayload = addresses[selectedAddress]._id;
            } else {
                addressPayload = { street: \`\${contactData.firstName} \${contactData.lastName}, \${contactData.street}, \${contactData.city}, \${contactData.state}, \${contactData.country} - \${contactData.pincode}. Ph: \${contactData.phone}\` };
            }

            try {
                const orderData = await dispatch(createOrder({
                    paymentMethod: method,
                    address: addressPayload,
                    shippingMode: shipping
                })).unwrap();

                if (method === 'ONLINE' && orderData.razorpayOrderId) {
                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Make sure this is in your env
                        amount: orderData.amount * 100,
                        currency: 'INR',
                        name: 'DSM Electro',
                        description: 'Test Transaction',
                        order_id: orderData.razorpayOrderId,
                        handler: async function (response: any) {
                            try {
                                await dispatch(verifyPayment({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: orderData._id
                                })).unwrap();
                                toast.success('Payment Successful!');
                                dispatch(clearCart());
                                setIsSuccess(true);
                            } catch (e) {
                                toast.error('Payment verification failed');
                            }
                        },
                        prefill: {
                            name: contactData.firstName || '',
                            email: contactData.email || '',
                            contact: contactData.phone || ''
                        },
                        theme: {
                            color: '#EE9C24'
                        }
                    };
                    const rzp1 = new window.Razorpay(options);
                    rzp1.on('payment.failed', function (response: any){
                        toast.error('Payment failed: ' + response.error.description);
                    });
                    rzp1.open();
                } else {
                    toast.success('Order placed successfully!');
                    dispatch(clearCart());
                    setIsSuccess(true);
                }
            } catch (err: any) {
                toast.error(err || 'Failed to place order');
            }
        } else {
            setCurrentStep(currentStep + 1);
        }
    };`;

content = content.replace(oldContinue, newContinue);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done patching checkout/page.tsx');
