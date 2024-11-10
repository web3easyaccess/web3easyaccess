import { Card, CardBody, CardHeader } from "@nextui-org/react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export function HistoricalGasTracker() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [historicalData, setHistoricalData] = useState({
        labels: [],
        datasets: [],
    });

    useEffect(() => {
        const fetchHistoricalGas = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const API_KEY = "4U7TMXB289TBXHT2WRT6MZN4QCGZA1E5R5";
                const endBlock = "latest";
                const startTime =
                    Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60; // 7 days ago
                const url = `https://api.etherscan.io/v2/api?chainid=1&module=stats&action=dailyavggasprice&startdate=2024-11-04&enddate=2024-11-10&sort=asc&apikey=${API_KEY}`;
                console.log("fetchHistoricalGas,url:", url);
                const response = await fetch(url);

                const result = await response.json();
                console.log("fetchHistoricalGas,response result:", result);

                if (result.status === "1" && result.result.length > 0) {
                    const labels = result.result.map((item: any) => {
                        const date = new Date(item.UTCDate);
                        return date.toLocaleDateString();
                    });

                    const gasValues = result.result.map((item: any) =>
                        // Convert Wei to Gwei
                        (parseFloat(item.avgGasPrice_Wei) / 1e9).toFixed(2)
                    );

                    setHistoricalData({
                        labels,
                        datasets: [
                            {
                                label: "Average Gas Price (Gwei)",
                                data: gasValues,
                                borderColor: "rgb(75, 192, 192)",
                                backgroundColor: "rgba(75, 192, 192, 0.2)",
                                tension: 0.1,
                                fill: true,
                            },
                        ],
                    });
                }
            } catch (error) {
                setError("Failed to load gas prices");
                console.error("Error fetching historical gas prices:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistoricalGas();
        // Fetch once per hour since this is historical data
        const interval = setInterval(fetchHistoricalGas, 3600000);

        return () => clearInterval(interval);
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "7-Day Historical Gas Prices",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Gas Price (Gwei)",
                },
            },
            x: {
                title: {
                    display: true,
                    text: "Date",
                },
            },
        },
    };

    return (
        <Card className="w-full p-4 mt-4">
            <CardHeader>
                <h3>7-Day Historical Gas Prices</h3>
            </CardHeader>
            <CardBody>
                {isLoading ? (
                    <div className="flex justify-center items-center h-[300px]">
                        Loading...
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-[300px] text-red-500">
                        {error}
                    </div>
                ) : (
                    <Line options={options} data={historicalData} />
                )}
            </CardBody>
        </Card>
    );
}
