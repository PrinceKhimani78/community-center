import ComingSoonPage from "@/components/common/ComingSoonPage";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ComingSoonPage
      title={`Booking Details (Receipt No. ${id})`}
      description="Detailed booking sheet, breakdown of hall charges, payment summary, and inspection checklist."
    />
  );
}
