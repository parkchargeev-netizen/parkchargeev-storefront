import { getHomePageData } from "@/features/home/application/get-home-page-data";
import { parkChargeHomeDataSource } from "@/features/home/infrastructure/parkcharge-home-data-source";
import { HomePageView } from "@/features/home/ui/home-page-view";

export default async function HomePage() {
  const viewModel = await getHomePageData(parkChargeHomeDataSource);

  return <HomePageView {...viewModel} />;
}
