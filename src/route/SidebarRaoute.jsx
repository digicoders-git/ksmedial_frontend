import { lazy } from "react";
import {
  FaCoins,
  FaUsers,
  FaBox,
  FaTachometerAlt,
  FaShoppingCart,
  FaEnvelopeOpenText,
  FaImages,
  FaKey,
  FaBlog,
  FaNetworkWired,
  FaWallet,
  FaMoneyBillWave,
  FaIdCard,
} from "react-icons/fa";

// pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Categories = lazy(() => import("../pages/Categories"));
const Products = lazy(() => import("../pages/Products"));
const Offers = lazy(() => import("../pages/Offers"));
const Orders = lazy(() => import("../pages/Orders"));
const Enquiries = lazy(() => import("../pages/Enquiries"));
const Sliders = lazy(() => import("../pages/Sliders"));
const Blogs = lazy(() => import("../pages/Blogs"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));

// MLM pages
const MLMDashboard = lazy(() => import("../pages/MLMDashboard"));
const Referrals = lazy(() => import("../pages/Referrals"));
const Earnings = lazy(() => import("../pages/Earnings"));
const Withdrawal = lazy(() => import("../pages/Withdrawal"));
const KYCApproval = lazy(() => import("../pages/KYCApproval"));

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: FaTachometerAlt },
  
  // MLM System
  { path: "/mlm-dashboard", component: MLMDashboard, name: "MLM Dashboard", icon: FaNetworkWired },
  { path: "/referrals", component: Referrals, name: "My Referrals", icon: FaUsers },
  { path: "/earnings", component: Earnings, name: "Earnings", icon: FaCoins },
  { path: "/kyc-approval", component: KYCApproval, name: "KYC Approval", icon: FaIdCard },
  { path: "/withdrawal", component: Withdrawal, name: "Withdraw Request", icon: FaMoneyBillWave },
  
  // E-commerce
  { path: "/categories", component: Categories, name: "Categories", icon: FaBox },
  { path: "/products", component: Products, name: "Products", icon: FaBox },
  { path: "/offers", component: Offers, name: "Offers", icon: FaWallet },
  { path: "/orders", component: Orders, name: "Orders", icon: FaShoppingCart },
  { path: "/enquiries", component: Enquiries, name: "Enquiries", icon: FaEnvelopeOpenText },
  { path: "/sliders", component: Sliders, name: "Sliders", icon: FaImages },
  { path: "/blogs", component: Blogs, name: "Blogs", icon: FaBlog },
  { path: "/change-password", component: ChangePassword, name: "Change Password", icon: FaKey },
];

export default routes;
