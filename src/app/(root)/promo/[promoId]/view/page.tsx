import { PromoForm } from "@/components/Form/Promo";
import Header from "@/components/Header";
import prisma from "@/lib/db";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Promo Form"
}

type Params = Promise<{ promoId: string }>;

const UpdatePromoForm = async ({
    params
}: {
    params: Params
}) => {
    const { promoId } = await params;
    const id = parseInt(promoId);

    const promo = await prisma.promo.findUnique({
        where: {
            id: id
        },
        include: {
            image: true
        }
    });

    return (
        <div>
            <Header title="Promo Form" />
            <section className="px-5 py-5">
                <PromoForm initialData={promo || undefined} />
            </section>
        </div>
    )
}

export default UpdatePromoForm;