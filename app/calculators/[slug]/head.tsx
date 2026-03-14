import { getCalculatorBySlug } from "@/lib/data/calculators";

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);

  if (!calculator) {
    return (
      <>
        <title>Calculator Not Found | QuickFnd</title>
        <meta
          name="description"
          content="The requested calculator could not be found."
        />
      </>
    );
  }

  return (
    <>
      <title>{calculator.name} | QuickFnd</title>
      <meta name="description" content={calculator.description} />
    </>
  );
}