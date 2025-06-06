import "../styles/globals.css";
import toast, { Toaster } from "react-hot-toast";
//INTRNAL IMPORT
import { NavBar, Footer } from "../components/componentsindex";
import { NFTMarketplaceProvider } from "../Context/NFTMarketplaceContext";
import GlobalAuctionMonitor from "../components/GlobalAuctionMonitor/GlobalAuctionMonitor";

const MyApp = ({ Component, pageProps }) => (
  <div>
    <NFTMarketplaceProvider>
      <GlobalAuctionMonitor/>
      <Toaster/>
      <NavBar />
      <Component {...pageProps} />
      <Footer />
    </NFTMarketplaceProvider>
  </div>
);

export default MyApp;
