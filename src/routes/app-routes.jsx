import BlogCreate from "@/app/blog/blog-create";
import BlogEdit from "@/app/blog/blog-edit";
import BlogList from "@/app/blog/blog-list";
import CategoryList from "@/app/category/category-list";
import Enquiry from "@/app/enquiry/enquiry";
import Sponsor from "@/app/sponsor/sponsor";

import Maintenance from "@/components/common/maintenance";
import LoadingBar from "@/components/loader/loading-bar";

import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";


const Login = lazy(() => import("@/app/auth/login"));



const NotFound = lazy(() => import("@/app/errors/not-found"));



const ForgotPassword = lazy(() =>
  import("@/components/forgot-password/forgot-password")
);
const AuthRoute = lazy(() => import("./auth-route"));
const ProtectedRoute = lazy(() => import("./protected-route"));

const Settings = lazy(() => import("@/app/setting/setting"));


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute />}>
        <Route path="/" element={<Login />} />
        {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<LoadingBar />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route path="/maintenance" element={<Maintenance />} />
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        {/* dashboard  */}
        <Route
          path="/category"
          element={
            <Suspense fallback={<LoadingBar />}>
              <CategoryList />
            </Suspense>
          }
        />
       

      
        

    
    

        <Route
          path="/blog"
          element={
            <Suspense fallback={<LoadingBar />}>
              <BlogList />
            </Suspense>
          }
        />
        <Route
          path="/create-blog"
          element={
            <Suspense fallback={<LoadingBar />}>
              <BlogCreate />
            </Suspense>
          }
        />
        <Route
          path="/blog/edit/:id"
          element={
            <Suspense fallback={<LoadingBar />}>
              <BlogEdit />
            </Suspense>
          }
        />
        <Route
          path="/enquiry"
          element={
            <Suspense fallback={<LoadingBar />}>
              <Enquiry />
            </Suspense>
          }
        />
        <Route
          path="/sponsor"
          element={
            <Suspense fallback={<LoadingBar />}>
              <Sponsor />
            </Suspense>
          }
        />
            {/* settings  */}
        <Route
          path="/settings"
          element={
            <Suspense fallback={<LoadingBar />}>
              <Settings />
            </Suspense>
          }
        />

       
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
