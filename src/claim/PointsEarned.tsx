import React from "react";
import { Platform, platformIcons } from "../types/platform";

interface PointsProps {
    points: { platform: string; points: string }[];
}

const Points: React.FC<PointsProps> = ({ points }) => {
    // Group points by platform and sum them
    const groupedPoints = points.reduce((acc, curr) => {
        const platform = curr.platform;
        const pointValue = parseFloat(curr.points);
        if (acc[platform]) {
            acc[platform] += pointValue;
        } else {
            acc[platform] = pointValue;
        }
        return acc;
    }, {} as Record<string, number>);

    // Convert grouped points to array and sort by total points (descending)
    const sortedPlatforms = Object.entries(groupedPoints)
        .sort(([, a], [, b]) => b - a)

    return (
        <div className="relative">
            <img src="/logo-large.svg" alt="Logo" className="points-earned-logo" />
            <div className="py-24 px-5 max-w-screen-lg m-auto text-center">
                <p className="block text-4xl font-semibold mb-10">Points you've earned</p>
                <div className="grid grid-cols-3 gap-4">
                    {sortedPlatforms.map(([platform, totalPoints], index) => (
                        <div
                            key={index}
                            className="pichi-card p-6 flex flex-col items-center justify-center w-full col-span-3 sm:col-span-1"
                        >
                            <img
                                src={platformIcons[platform.toLowerCase() as Platform] || "/default-icon.svg"}
                                alt={`${platform} icon`}
                                className="mb-6 w-12"
                            />
                            <span className="text-lg font-semibold">
                                {totalPoints.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-white-70">{platform}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Points;