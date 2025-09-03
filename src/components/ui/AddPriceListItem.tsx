// import React, { useState } from 'react'
// import SearchableDropdown from './SearchAbleDropdown';

// const AddPriceListItem = ({ data, itemOptions }: {
//     data: { item_name: string; item_id: string; pricebook_rate: number }[], itemOptions: {
//         item_name: string;
//         item_id: string;
//         pricebook_rate: number;
//     }[]
// }) => {


//     const [currentItem, setCurrentItem] = useState({ item: "", rate: 0 })
//     const handleAddItem = (id: string
//     }

// return (
//     <>
//         <div className='w-full'>
//             <div className='flex space-x-4'>

//                 <div className="col-span-7">
//                     <SearchableDropdown
//                         options={itemOptions.map(item => ({ name: item.item_name, value: item.item_id }))}
//                         value={currentItem.item}
//                         onSelect={(opt) => {
//                             setCurrentItem(prev => ({ ...prev, item: opt.value }))
//                         }}
//                         placeholder="Select item"
//                     />
//                 </div>
//                 <div className="col-span-4">
//                     <input
//                         type="number"
//                         min={0}
//                         step="0.01"
//                         value={currentItem.rate}
//                         onChange={(e) => {
//                             setCurrentItem(prev => ({ ...prev, rate: parseFloat(e.target.value) }))
//                         }}
//                         className="w-full px-3 py-2 border rounded-md"
//                         placeholder="1.00"
//                     />
//                 </div>
//                 <button
//                     type="button"
//                     onClick={() => setCurrentItem({ item: "", rate: 0 })}
//                     className="text-red-600 hover:bg-red-50 rounded-md px-2 py-1"
//                     aria-label="Remove"
//                 >
//                     ✕
//                 </button>
//             </div>
//             <button className=' bg-teal-500 hover:bg-teal-700 text-white p-2 rounded-md w-full'>Add Item</button>
//         </div>
//         <div className='overflow-x-auto w-full'>
//             <div className='border-b border-zinc-300 grid grid-cols-12 gap-2 max-w-11/12 mx-auto'>
//                 <p className=' col-span-8'>Item Name</p>
//                 <p className=' col-span-4'>Item Rate</p>
//             </div>
//             {data.length ? data.map(row => (
//                 <div className='grid border-b border-zinc-300 grid-cols-12 gap-2 max-w-11/12 mx-auto'>
//                     <p className='col-span-8'>{row.item_name}</p>
//                     <p className=' col-span-4'>{row.item_name}</p>
//                 </div>
//             )) : <p className='text-center w-full text-gray-300'>Select an Item</p>}
//         </div>

//     </>

// )
// }

// export default AddPriceListItem