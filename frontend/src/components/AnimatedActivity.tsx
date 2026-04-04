import { motion } from 'framer-motion';

export const AnimatedActivity = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle' }}>
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 8px ${color === 'currentColor' ? 'rgba(52, 211, 153, 0.4)' : color})` }}
        >
            <motion.path
                d="M2 12h4l3-9l6 18l3-9h4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                    pathLength: [0, 1, 1],
                    pathOffset: [0, 0, 1],
                    opacity: [1, 1, 0]
                }}
                transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.7, 1]
                }}
            />
            <path
                d="M2 12h4l3-9l6 18l3-9h4"
                opacity="0.1"
                strokeWidth="1.5"
            />
        </motion.svg>
    </div>
);
