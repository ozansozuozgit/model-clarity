import { CheatsheetApp } from "@/components/CheatsheetApp";
import { confusionGuides, glossary, models, productEntries, providers, useCases } from "@/lib/catalog";

export default function Home() {
  return (
    <CheatsheetApp
      confusionGuides={confusionGuides}
      glossary={glossary}
      models={models}
      productEntries={productEntries}
      providers={providers}
      useCases={useCases}
    />
  );
}
