import { CompassApp } from "@/components/CompassApp";
import { confusionGuides, glossary, models, productEntries, providers, useCases } from "@/lib/catalog";

export default function Home() {
  return (
    <CompassApp
      confusionGuides={confusionGuides}
      glossary={glossary}
      models={models}
      productEntries={productEntries}
      providers={providers}
      useCases={useCases}
    />
  );
}
