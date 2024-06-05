import React, { useContext, useMemo, useState } from 'react';
import CustomModal from '../custom_components/CustomModal';
import Waiter from './DeliveryWaiter';
import { useMutation, useQuery } from 'react-query';
import { postDeliveryOrder } from '../../server/api';
import { CashOrderContextProvider } from '../../context/CashOrderContextProvider';
import Loading from '../custom_components/Loading';

const generateSummaryString = (summary) => {
    return Object.entries(summary).map(([name, count]) => `${name} ${count}x`).join(', ');
};

const DeliverOrder = ({ open, setOpen }) => {
    const {orders_data} = useContext(CashOrderContextProvider);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        item: '',
        datetime: '',
        deliveryCharges: '',
        description: '',
    });

    const [addedItems, setAddedItems] = useState([]);
    const [isWaiterOpen, setIsWaiterOpen] = useState(false);
    const [errors, setErrors] = useState({});

    const handleAddItem = (item) => {
        setAddedItems([...addedItems, item]);
        setIsWaiterOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validate = () => {
        let formErrors = {};
        if (!formData.name) formErrors.name = 'Name is required';
        if (!formData.address) formErrors.address = 'Address is required';
        if (!formData.phone) formErrors.phone = 'Phone number is required';
        if (!formData.datetime) formErrors.datetime = 'Expected delivery time is required';
        return formErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validate();
        if (Object.keys(formErrors).length === 0) {
            console.log('Form Data Submitted:', formData);
            onPostDelivery(formData);
            // Handle form submission here (e.g., send data to the server)
            setOpen(false); // Close modal after submission
        } else {
            setErrors(formErrors);
        }
    };

    const summarizeItems = useMemo(() => {
        const summary = {};
        addedItems.forEach(item => {
            if (summary[item.name]) {
                summary[item.name]++;
            } else {
                summary[item.name] = 1;
            }
        });
        return generateSummaryString(summary);
    }, [addedItems]);

    const [loading, setLoading] = useState(false);


    const postDelivery = useMutation(postDeliveryOrder, {
        onMutate: (e) => {
            setLoading(true);
        }, onSuccess: (e) => {
            setLoading(false);
            orders_data.refetch();
        }
    })

    const onPostDelivery = (formData) => {
        const summary = {};
        addedItems.forEach(item => {
            if (summary[item.id]) {
                summary[item.id].qty += 1
            } else {
                summary[item.id] = {
                    ...item,
                    qty: 1
                }
            }
        });

        const orders = Object.values(summary);
        console.log(orders)
        orders.map((item) => {
            postDelivery.mutate({ ...formData, pdid: item.id, qty: item.qty, ispd: item.ispd, is_Delivery: true })

        })

    }

    return (
        <CustomModal open={open} setOpen={setOpen} title="Delivery Order">
            <Loading show={loading} setShow={setLoading} message='Ordering'/>
            <form onSubmit={handleSubmit} className="space-y-1">
                <div className="flex flex-col">
                    <label className=" text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="flex flex-col">
                    <label className=" text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>

                <div className="flex flex-col">
                    <label className=" text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                <div className="flex flex-col">
                    <label className=" text-sm font-medium text-gray-700">Item</label>
                    <div className="flex flex-row gap-1">
                        <input
                            type="text"
                            name="item"
                            value={summarizeItems}
                            onChange={handleChange}
                            className="p-2 border border-gray-300 rounded w-full"
                            placeholder='Please Choose Item'
                        />
                        <div className="flex flex-row gap-1">
                            <button type="button" className="p-2 bg-gray-300 border hover:bg-gray-200" onClick={e => {
                                e.preventDefault();
                                setAddedItems([])
                            }}>
                                <i className="bi bi-x" />
                            </button>
                            <button type="button" className="p-2 bg-gray-300 border hover:bg-gray-200" onClick={e => {
                                e.preventDefault();
                                setIsWaiterOpen(true)
                            }}>
                                <i className="bi bi-plus-circle" />
                            </button>
                        </div>
                    </div>
                    {errors.item && <p className="text-red-500 text-sm">{errors.item}</p>}
                </div>

                <div className="flex flex-col">
                    <label className=" text-sm font-medium text-gray-700">Expected Delivery Time</label>
                    <input
                        type="datetime-local"
                        name="datetime"
                        value={formData.datetime}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.datetime && <p className="text-red-500 text-sm">{errors.datetime}</p>}
                </div>

                <div className="flex flex-col">
                    <label className=" text-sm font-medium text-gray-700">Delivery Charges</label>
                    <input
                        type="number"
                        name="deliveryCharges"
                        value={formData.deliveryCharges}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                    />
                    {errors.deliveryCharges && <p className="text-red-500 text-sm">{errors.deliveryCharges}</p>}
                </div>

                <div className="flex flex-col">
                    <label className=" text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded"
                        rows="3"
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Submit
                </button>
            </form>
            <CustomModal open={isWaiterOpen} setOpen={setIsWaiterOpen} full>
                <Waiter
                    onAddItem={handleAddItem}
                    addedItems={addedItems}
                    summarizeItems={summarizeItems}
                    setAddedItems={setAddedItems}
                />
            </CustomModal>
        </CustomModal>
    );
};

export default DeliverOrder;
