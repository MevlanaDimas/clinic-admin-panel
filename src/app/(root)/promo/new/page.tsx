import { PromoForm } from "@/components/Form/Promo";
import Header from "@/components/Header";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "Promo Form"
}

const CreatePromoForm = () => {
    return (
        <div>
            <Header title="Promo Form" />
            <section className="px-5 py-5">
                <PromoForm />
            </section>
        </div>
    )
}

export default CreatePromoForm;