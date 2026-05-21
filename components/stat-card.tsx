"use client";

import { motion } from "framer-motion";

type Props = {
    title: string;
    value: string | number;
};

export default function StatCard({
    title,
    value,
}: Props) {
    return (
        <motion.div
            whileHover={{
                y: -5,
            }}
            transition={{
                duration: 0.2,
            }}
            className="bg-white rounded-2xl shadow p-5"
        >
            <p className="text-zinc-500 text-sm">
                {title}
            </p>

            <h2 className="text-3xl font-bold mt-2">
                {value}
            </h2>
        </motion.div>
    );
}