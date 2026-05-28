import { PERMISSION_MAP } from "../src/config/permissionMap.js";

const url = "/api/v1/home";
const method = "GET";

let requiredPermission = null;
for (const pattern in PERMISSION_MAP) {
  const regexPattern = pattern.replace(/:[^\/]+/g, "[^/]+").replace(/\//g, "\\/");
  const regex = new RegExp(`^${regexPattern}$`);
  const isMatch = regex.test(url);
  console.log(`Pattern: ${pattern} -> Regex: ${regex} | Match: ${isMatch}`);
  if (isMatch) {
    requiredPermission = PERMISSION_MAP[pattern][method];
    console.log(`Matched! Required permission: ${requiredPermission}`);
    if (requiredPermission) break;
  }
}
