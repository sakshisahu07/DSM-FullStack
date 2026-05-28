const fs = require('fs');

const filePath = 'app/checkout/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const oldMap = `                                                {[0, 1].map((idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setSelectedAddress(idx)}
                                                        className="flex items-start gap-4 cursor-pointer group"
                                                    >
                                                        <div className={\`w-5 h-5 mt-1 border-2 rounded-sm rotate-45 flex items-center justify-center transition-colors \${selectedAddress === idx ? 'bg-[#EE9C24] border-[#EE9C24]' : 'bg-white border-gray-100'}
                                                            \`}>
                                                            {selectedAddress === idx && <div className="-rotate-45 mb-0.5"><Check className="text-white" size={14} strokeWidth={4} /></div>}
                                                        </div>
                                                        <div className="flex">
                                                            <div className="flex flex-col sm:flex-row sm:items-center">
                                                                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                                                    <span className="text-[#9C939D] text-xs sm:text-sm">Deliver to</span>
                                                                    <Image src="/loc.png" alt="location" width={14} height={14} className="sm:w-4 sm:h-4" />
                                                                </div>
                                                                <p className="text-[#333333] sm:ml-2 text-xs sm:text-sm tracking-tight leading-relaxed pr-0 sm:pr-8">
                                                                    2118 Thornridge Cir. Syracuse, Connecticut 35624
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}`;

const newMap = `                                                {addresses && addresses.length > 0 ? addresses.map((addr: any, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setSelectedAddress(idx)}
                                                        className="flex items-start gap-4 cursor-pointer group"
                                                    >
                                                        <div className={\`w-5 h-5 mt-1 border-2 rounded-sm rotate-45 flex items-center justify-center transition-colors \${selectedAddress === idx ? 'bg-[#EE9C24] border-[#EE9C24]' : 'bg-white border-gray-100'
                                                            }\`}>
                                                            {selectedAddress === idx && <div className="-rotate-45 mb-0.5"><Check className="text-white" size={14} strokeWidth={4} /></div>}
                                                        </div>
                                                        <div className="flex">
                                                            <div className="flex flex-col sm:flex-row sm:items-center">
                                                                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                                                    <span className="text-[#9C939D] text-xs sm:text-sm">Deliver to</span>
                                                                    <Image src="/loc.png" alt="location" width={14} height={14} className="sm:w-4 sm:h-4" />
                                                                </div>
                                                                <p className="text-[#333333] sm:ml-2 text-xs sm:text-sm tracking-tight leading-relaxed pr-0 sm:pr-8">
                                                                    {addr.street || 'Address not found'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className="text-gray-500 text-sm">No addresses found. Proceeding will use contact address.</p>
                                                )}`;

if (content.includes(oldMap)) {
    content = content.replace(oldMap, newMap);
} else {
    console.log("Could not find the exact oldMap pattern. Will try regex.");
    content = content.replace(/\{\[0,\s*1\]\.map\(\(idx\)\s*=>\s*\([\s\S]*?2118 Thornridge Cir[\s\S]*?\}\)\}/, newMap);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done mapping addresses');
