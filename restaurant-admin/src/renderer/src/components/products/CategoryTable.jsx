import React, { useMemo } from 'react';
import numberWithCommas from '../custom_components/NumberWithCommas';
import { useTranslation } from 'react-i18next';
import { IDToCategory, useCategoryData } from '../../context/CategoryDataProvider';
import { countProducts } from '../../context/ProductsDataProvider';
import { useMutation } from 'react-query'
import { putCategorys } from '../../server/api';

const generateRandomData = (numItems) => {
    const data = [];
    for (let i = 0; i < numItems; i++) {
        data.push({
            name: `Product ${i + 1}`,
            price: Math.floor(Math.random() * 10000) + 1,
        });
    }
    return data;
};

const CategoryTable = ({ data, searchtext = '', sortby = 'name', selectedRow, setSelectedRow, rowDoubleClick }) => {
    const { t } = useTranslation();

    const {category_data, data:categorys} = useCategoryData(); 

    const putTable = useMutation(putCategorys,{
        onSuccess:()=>{
            category_data.refetch();
        }
    })


    //filter data with searchtext by product name and barcode and category and also sort with sortby ('title', 'products')
    const filterData = useMemo(() => {
        if (data) {
            const sorted_data = data.sort((a, b) => {
                if (sortby === 'name') {
                    return a.title.localeCompare(b.title);
                } else if (sortby === 'products') {
                    return countProducts(b.id) - countProducts(a.id);
                } else {
                    return 0;
                }
            }
            )

            return sorted_data.filter(item => {
                if (item.title.toLowerCase().includes(searchtext.toLowerCase())) {
                    return item;
                }
            })
        }
    }, [data, searchtext, sortby])

    const defaultdata = generateRandomData(3);
    return (
        <div className={`w-full overflow-auto my-2`} style={{
            height: "calc(100vh - 200px)"
        }}>
            <div className='w-full h-full'>
                <table className='w-full'>
                    <thead className='bg-primary sticky top-0 text-white'>
                        <tr>
                            <th className='border px-2 py-2'>{t('No')}</th>
                            <th className='border px-2 py-2'>{t('Title')}</th>
                            <th className='border px-2 py-2'>{t('Products')}</th>
                            <th className='border px-2 py-2'>{t('Status')}</th>

                        </tr>
                    </thead>
                    <tbody className='mt-1'>
                        {data ? filterData.map((item, index) => (
                             <tr
                             onDoubleClick={() => rowDoubleClick(item)}
                             key={index}
                             className={`cursor-pointer hover:bg-slate-100 select-none ${selectedRow?.id === item.id ? 'bg-blue-200' : ''}`}
                         >
                                <td className='border px-2 py-1'>{index + 1}</td>
                                <td className='border px-2 py-1'>{item.title}</td>
                                <td className='border px-2 py-1 text-right'>{countProducts(item.id)}</td>
                                <td className='border px-2 py-1 text-center'>
                                    <input type="checkbox" checked={item.show == 'true' || item.show == "True" || item.show == true} onChange={e=>{
                                        console.log(item.show)
                                        putTable.mutate({
                                            id : item.id,
                                            show : !item.show
                                        })
                                    }}/> Show
                                </td>
                                
                            </tr>
                        )) : defaultdata.map((item, index) => (
                            <tr key={index} className='cursor-pointer hover:bg-slate-400'>
                                <td className='border px-2 py-1'>{item.name}</td>
                                <td className='border px-2 py-1'>{numberWithCommas(item.price)} </td>
                                <td className='border px-2 py-1'>{numberWithCommas(item.price)} </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default CategoryTable;