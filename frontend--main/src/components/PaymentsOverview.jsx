import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentsOverview = () => {
    const [payments, setPayments] = useState([]);
    const [monthlyTotals, setMonthlyTotals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            setError(''); // Reset error message before fetching

            try {
                const response = await axios.get('/api/payments');
                setPayments(response.data);

                // Calculate total payments per month
                const totals = response.data.reduce((acc, payment) => {
                    const month = new Date(payment.date).toLocaleString('default', { month: 'short', year: 'numeric' });
                    acc[month] = (acc[month] || 0) + payment.amount;
                    return acc;
                }, {});
                setMonthlyTotals(Object.entries(totals).map(([month, total]) => ({ month, total })));
            } catch (error) {
                console.error('Error fetching payments', error);
                setError('Failed to load payments. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Payments Overview</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h3>Payments per Day</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map(payment => (
                        <tr key={payment.id}>
                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                            <td>{payment.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h3>Total Payments per Month</h3>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {monthlyTotals.map(({ month, total }) => (
                        <tr key={month}>
                            <td>{month}</td>
                            <td>{total.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentsOverview;
