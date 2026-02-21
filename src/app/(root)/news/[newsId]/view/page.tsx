import { NewsForm } from "@/components/Form/News";
import Header from "@/components/Header";
import prisma from "@/lib/db";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "News Form"
}

type Params = Promise<{ newsId: string }>;

const UpdateNewsForm = async ({
    params
}: {
    params: Params
}) => {
    const { newsId } = await params;

    const news = await prisma.news.findUnique({
        where: {
            id: newsId
        },
        include: {
            author: true,
            category: true,
            images: true
        }
    });

    return (
        <div>
            <Header title="Promo Form" />
            <section className="px-5 py-5">
                <NewsForm initialData={news || undefined} />
            </section>
        </div>
    )
}

export default UpdateNewsForm;