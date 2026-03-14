const calculators: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  "emi-calculator": {
    name: "EMI Calculator",
    description:
      "Calculate monthly EMI payments for loans with ease.",
  },
  "age-calculator": {
    name: "Age Calculator",
    description:
      "Find your exact age based on your date of birth.",
  },
  "percentage-calculator": {
    name: "Percentage Calculator",
    description:
      "Calculate percentages for marks, discounts, and more.",
  },
};

export default async function CalculatorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const calculator = calculators[slug];

  if (!calculator) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-10">
        <h1 className="text-4xl font-bold mb-4">Calculator Not Found</h1>
        <p className="text-gray-400">
          The calculator you are looking for does not exist.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-4">{calculator.name}</h1>
      <p className="text-gray-400 mb-8 max-w-2xl">
        {calculator.description}
      </p>

      <div className="bg-gray-900 p-6 rounded-xl max-w-3xl">
        <p className="text-lg text-gray-300">
          This is where the actual {calculator.name.toLowerCase()} interface will go.
        </p>
      </div>
    </main>
  );
}