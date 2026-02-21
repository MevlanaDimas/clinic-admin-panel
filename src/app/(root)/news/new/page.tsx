import { NewsForm } from "@/components/Form/News";
import Header from "@/components/Header"
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";


export const metadata: Metadata = {
    title: "News Form"
}

const CreateNewsForm = async () => {
    const user = await currentUser();

    const staff = await prisma.staff.findUnique({
        where: {
            id: user?.id
        }
    })

    return (
        <div>
            <Header title="News Form" />
            <section className="px-5 py-5">
                <NewsForm staff={staff || undefined} />
            </section>
        </div>
    )
}

export default CreateNewsForm;