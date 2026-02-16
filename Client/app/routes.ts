import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
    route("chat", "routes/chat.tsx"),
    route("new", "routes/create.tsx"),
] satisfies RouteConfig;
