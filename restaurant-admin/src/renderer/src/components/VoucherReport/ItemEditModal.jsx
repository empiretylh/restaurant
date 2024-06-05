import React, { useState, useEffect, useMemo, useRef } from "react";
import CustomModal from "../custom_components/CustomModal";

const ItemEditModal = ({ show, setShow, data, ispd = false, onVoucherUpdate}) => {
    const [newData, setNewData] = useState(JSON.parse(JSON.stringify(data)));
    const [OriginalQty, setOriginalQty] = useState(data.qty);
    const [qty, setQty] = useState(0);
    const [removeQty, setRemoveQty] = useState(0);
    const [wasteQty, setWasteQty] = useState(0);
    const [item_ids, setItemIds] = useState([]); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    const focusRef = useRef(null);

    useEffect(() => {
        setQty(data.qty);
        setNewData(data);
        setOriginalQty(data.qty);
        setRemoveQty(0)
        setWasteQty(0)
        focusRef.current.focus();
        focusRef.current.select();
    }, [data, ispd]);

    useEffect(() => {
        if(removeQty === "") setRemoveQty(0);
        if(wasteQty === "") setWasteQty(0);
      
        let calqty = parseInt(OriginalQty) - (parseInt(removeQty) + parseInt(wasteQty));
        setQty(calqty)
        console.log(newData.qty)
        setNewData(newData);


    }, [removeQty, wasteQty])

    return (
        <CustomModal open={show} setOpen={setShow} title="Edit Item">
            <form className="grid grid-cols-2 gap-2" onSubmit={(e)=>{
                e.preventDefault();
              
                onVoucherUpdate(removeQty, wasteQty, newData?.ordercombine_id, ispd ? "product" : "food");
                setShow(false);

            }}>
                <div>
                    <label htmlFor="name" className="font-semibold">Name</label>
                    <input type="text" id="name" name="name" value={ispd ? newData?.product?.name : newData?.food?.name} className="w-full border p-2 bg-gray-200" />
                </div>
                <div>
                    <label htmlFor="removeqty" className="font-semibold">Original Qty</label>
                    <input type="number" id="removeqty" name="removeqty" value={qty} className="w-full border p-2 bg-gray-200" />
                </div>
                <hr className="col-span-2" />
                <div>

                    <label htmlFor="removeqty" className="font-semibold">Remove Qty</label>
                    <input type="number" id="removeqty" name="removeqty" ref={focusRef} className="w-full border p-2" placeholder="Remove Qty" value={removeQty} onChange={e => {
                        setRemoveQty(e.target.value);

                    }} />
                </div>
                <div>
                    <label htmlFor="addqty" className="font-semibold">Waste Qty</label>
                    <input type="number" id="addqty" name="addqty" className="w-full border p-2" placeholder="Waste Qty" value={wasteQty} onChange={e => {
                        setWasteQty(e.target.value);
                    }} />
                </div>

                <button type="submit" className="bg-blue-500 text-white p-2 mt-4 w-full col-span-2">Submit</button>


            </form>
        </CustomModal>
    )

}

export default ItemEditModal;