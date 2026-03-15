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
  FaStore,
  FaWarehouse,
  FaTags,
  FaPrescriptionBottleAlt,
} from "react-icons/fa";

// pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
// const Categories = lazy(() => import("../pages/Categories"));
// const Products = lazy(() => import("../pages/Products"));
const Offers = lazy(() => import("../pages/Offers"));
const Orders = lazy(() => import("../pages/Orders"));
const Enquiries = lazy(() => import("../pages/Enquiries"));
const Sliders = lazy(() => import("../pages/Sliders"));
const Blogs = lazy(() => import("../pages/Blogs"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));
const Shops = lazy(() => import("../pages/Shops"));
const InventoryMaster = lazy(() => import("../pages/InventoryMaster"));
const PrescriptionRequests = lazy(() => import("../pages/PrescriptionRequests"));

// Referal pages
const ReferalDashboard = lazy(() => import("../pages/ReferalDashboard"));
const Referrals = lazy(() => import("../pages/Referrals"));
const Customers = lazy(() => import("../pages/Customers"));
const Earnings = lazy(() => import("../pages/Earnings"));
const Withdrawal = lazy(() => import("../pages/Withdrawal"));
const KYCApproval = lazy(() => import("../pages/KYCApproval"));

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: FaTachometerAlt },
  
  // CRM
  { path: "/customers", component: Customers, name: "Customers", icon: FaUsers },

  // Referal System
  { path: "/referal-dashboard", component: ReferalDashboard, name: "Referal Dashboard", icon: FaNetworkWired },
  { path: "/referrals", component: Referrals, name: "My Referrals", icon: FaUsers },
  { path: "/earnings", component: Earnings, name: "Earnings", icon: FaCoins },
  { path: "/kyc-approval", component: KYCApproval, name: "KYC Approval", icon: FaIdCard },
  { path: "/withdrawal", component: Withdrawal, name: "Withdraw Request", icon: FaMoneyBillWave },
  
  // Dynamic Inventory
  { path: "/inventory-master", component: InventoryMaster, name: "Inventory Master", icon: FaWarehouse },

  // E-commerce
  { path: "/shops", component: Shops, name: "Shops", icon: FaStore },
  { path: "/prescription-requests", component: PrescriptionRequests, name: "Prescription Rx", icon: FaPrescriptionBottleAlt },
  { path: "/offers", component: Offers, name: "Offers", icon: FaTags },
  { path: "/orders", component: Orders, name: "Orders", icon: FaShoppingCart },
  { path: "/enquiries", component: Enquiries, name: "Enquiries", icon: FaEnvelopeOpenText },
  { path: "/sliders", component: Sliders, name: "Sliders", icon: FaImages },
  { path: "/blogs", component: Blogs, name: "Blogs", icon: FaBlog },
  { path: "/change-password", component: ChangePassword, name: "Change Password", icon: FaKey },
];

export default routes;
