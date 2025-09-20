import Image from "next/image";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

const font = Poppins({
    weight: ["400", "600"],
    subsets: ["latin"],
});

export const Logo = () => {
    return ( 
        <div className="hidden md:flex items-center gap-x-2">
            <Image 
                src="/logolight.png"
                height="40"
                alt="Gitstack Logo"
                width="40"
                className="dark:hidden"
            />
            <Image 
                src="/logodark.png"
                height="40"
                alt="Gitstack Logo"
                width="40"
                className="hidden dark:block"
            />
            <span className="text-lg font-bold">Gitstack</span>
        </div>
    );
}