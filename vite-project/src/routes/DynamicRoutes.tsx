import { Route } from "react-router-dom";
import { componentMap } from "./componentMap";

export const generateRoutes = (menus: any[]) => {
    const routes: any[] = [];

    menus.forEach((menu) => {

        const parentComponent = componentMap[menu.key];

        if (parentComponent) {
            const ParentComp = parentComponent;
            const parentPath = menu.key.replace(/\./g, "/");

            routes.push(
                <Route
                    key={menu.key}
                    path={`/${parentPath}`}
                    element={<ParentComp />}
                />
            );
        }

        menu.children?.forEach((child: any) => {
            const component = componentMap[child.key];

            if (!component) return;

            const Comp = component;
            const path = child.key.replace(/\./g, "/");

            routes.push(
                <Route
                    key={child.key}
                    path={`/${path}`}
                    element={<Comp />}
                />
            );
        });
    });

    return routes;
};
