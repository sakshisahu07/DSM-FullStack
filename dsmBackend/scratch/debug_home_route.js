import app from "../src/app.js";

function getRouteStack(app) {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(middleware.route);
    } else if (middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push(handler.route);
        }
      });
    }
  });
  return routes;
}

const routes = getRouteStack(app);
const homeRoute = routes.find(r => r.path === '/home');
if (homeRoute) {
  console.log("Handlers for /home:", homeRoute.stack.map(s => s.name || 'anonymous'));
} else {
  console.log("Could not find route /home");
}
