import { Route } from "react-router-dom";
import { componentMap } from "./componentMap";

export const generateRoutes = (menus: any[]) => {
    const routes: any[] = [];

    // Recursive function to handle n-level nested menus
    const processMenu = (menu: any) => {
        // Only process if menu has a key and corresponding component
        if (menu.key && componentMap[menu.key]) {
            const Component = componentMap[menu.key];
            const path = menu.key.replace(/\./g, "/");

            routes.push(
                <Route
                    key={menu.key}
                    path={`/${path}`}
                    element={<Component />}
                />
            );
        }

        // Recursively process children
        if (menu.children && Array.isArray(menu.children)) {
            menu.children.forEach((child: any) => {
                processMenu(child); // Recursive call
            });
        }
    };

    // Process all root menus
    menus.forEach((menu) => {
        processMenu(menu);
    });

    console.log("Generated routes:", routes.length);
    return routes;
};