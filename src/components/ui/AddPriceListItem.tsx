import React, { useState } from 'react'
import SearchableDropdown from './SearchAbleDropdown';
import { FormikProps } from 'formik';
import { FormState } from '../form/PriceList';

const AddPriceListItem = ({ formik, itemOptions }: {
    itemOptions: {
        item_name: string;
        item_id: string;
        pricebook_rate: number;
    }[]
    formik: FormikProps<FormState>;
}) => {


    const [currentItem, setCurrentItem] = useState({ item: "", rate: 0 })
    const handleAddItem = () => {
        const findItem = itemOptions.find(data => data.item_id === currentItem.item)
        if (formik.values.pricebook_items) {
            formik.setFieldValue("pricebook_items", [...formik.values.pricebook_items, { item_name: findItem?.item_name, item_id: findItem?.item_id, pricebook_rate: currentItem.rate }])
        }

    }

    const removeItem = (id: string) => {
        if (formik.values.pricebook_items) {
            const filteredItems = formik.values.pricebook_items.filter(item => item.item_id !== id)
            formik.setFieldValue("pricebook_items", filteredItems)
        }

    }


    return (
        <>
            <div className='w-full'>
                <div className='flex space-x-4'>

                    <div className="w-3/4">
                        <SearchableDropdown
                            options={itemOptions.map(item => ({ name: item.item_name, value: item.item_id }))}
                            value={currentItem.item}
                            onSelect={(opt) => {
                                setCurrentItem(prev => ({ ...prev, item: opt.value }))
                            }}
                            placeholder="Select item"
                        />
                    </div>
                    <div className="col-span-4">
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={currentItem.rate}
                            onChange={(e) => {
                                setCurrentItem(prev => ({ ...prev, rate: parseFloat(e.target.value) }))
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="1.00"
                        />
                    </div>

                </div>
                <button type='button' onClick={() => handleAddItem()} className=' bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-md w-full my-4'>Add Item</button>
            </div>
            <div className='overflow-x-auto w-full bg-gray-100 rounded-md p-2'>
                <div className='border-b border-zinc-300 grid grid-cols-12 gap-2 max-w-11/12 mx-auto'>
                    <p className=' col-span-6'>Item Name</p>
                    <p className=' col-span-4'>Item Rate</p>
                </div>
                {formik.values.pricebook_items && formik.values.pricebook_items.length ? formik.values.pricebook_items.map(row => (
                    <div key={row.item_id} className='grid py-2 border-b border-zinc-300 grid-cols-12 gap-2 max-w-11/12 mx-auto'>
                        <p className='col-span-6'>{row.item_name}</p>
                        <p className=' col-span-4'>{row.pricebook_rate}</p>
                        <button

                            type="button"
                            onClick={() => removeItem(row.item_id)}
                            className="text-red-600 col-span-2 hover:bg-red-50 rounded-md px-2 py-1"
                            aria-label="Remove"
                        >
                            ✕
                        </button>
                    </div>
                )) : <p className='text-center w-full text-gray-300'>Select an Item</p>}
            </div>

        </>

    )
}

export default AddPriceListItem