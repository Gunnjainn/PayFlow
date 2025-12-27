import { useEffect, useState } from "react";
import { getTransactions } from "../api/account";

export const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await getTransactions(10);
                setTransactions(res.data.transactions);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    if (loading) {
        return <div className="text-center py-4 text-gray-500">Loading transactions...</div>;
    }

    if (transactions.length === 0) {
        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold mb-2 text-gray-800">Recent Transactions</div>
                <div className="text-gray-500">No transactions yet</div>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="text-lg font-semibold mb-4 text-gray-800">Recent Transactions</div>
            <div className="space-y-2">
                {transactions.map((txn) => (
                    <div key={txn.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="font-medium text-gray-800">
                                    {txn.type === 'sent' ? `Sent to ${txn.to.name}` : `Received from ${txn.from.name}`}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(txn.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className={`font-semibold ${txn.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                                {txn.type === 'sent' ? '-' : '+'}${txn.amount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

