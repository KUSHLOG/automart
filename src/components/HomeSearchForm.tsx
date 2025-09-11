'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FormData {
    make: string
    model: string
    year: string
    price: string
}

const HomeSearchForm = () => {
    const router = useRouter()
    const [formData, setFormData] = useState<FormData>({
        make: '',
        model: '',
        year: '',
        price: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Build search params
        const params = new URLSearchParams()
        if (formData.make && formData.make !== '') params.set('make', formData.make)
        if (formData.model && formData.model !== '') params.set('model', formData.model)
        if (formData.year && formData.year !== '') params.set('year', formData.year)
        if (formData.price && formData.price !== '') params.set('price', formData.price)

        // Navigate to vehicles page with search params
        const queryString = params.toString()
        router.push(`/vehicles${queryString ? `?${queryString}` : ''}`)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 max-w-7xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                <div className="space-y-2 lg:col-span-1">
                    <label className="text-sm text-gray-300 block font-medium">Make</label>
                    <select
                        name="make"
                        value={formData.make}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="" className="bg-gray-900">
                            Any Make
                        </option>
                        <option value="Toyota" className="bg-gray-900">
                            Toyota
                        </option>
                        <option value="Honda" className="bg-gray-900">
                            Honda
                        </option>
                        <option value="BMW" className="bg-gray-900">
                            BMW
                        </option>
                        <option value="Mercedes" className="bg-gray-900">
                            Mercedes
                        </option>
                        <option value="Audi" className="bg-gray-900">
                            Audi
                        </option>
                    </select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                    <label className="text-sm text-gray-300 block font-medium">Model</label>
                    <select
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="" className="bg-gray-900">
                            Any Model
                        </option>
                        <option value="A4" className="bg-gray-900">
                            A4
                        </option>
                        <option value="C-Class" className="bg-gray-900">
                            C-Class
                        </option>
                        <option value="Camry" className="bg-gray-900">
                            Camry
                        </option>
                        <option value="Civic" className="bg-gray-900">
                            Civic
                        </option>
                        <option value="RX 350" className="bg-gray-900">
                            RX 350
                        </option>
                        <option value="X5" className="bg-gray-900">
                            X5
                        </option>
                    </select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                    <label className="text-sm text-gray-300 block font-medium">Year</label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="" className="bg-gray-900">
                            Any Year
                        </option>
                        <option value="2024" className="bg-gray-900">
                            2024
                        </option>
                        <option value="2023" className="bg-gray-900">
                            2023
                        </option>
                        <option value="2022" className="bg-gray-900">
                            2022
                        </option>
                        <option value="2021" className="bg-gray-900">
                            2021
                        </option>
                        <option value="2020" className="bg-gray-900">
                            2020
                        </option>
                    </select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                    <label className="text-sm text-gray-300 block font-medium">Price Range</label>
                    <select
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="" className="bg-gray-900">
                            Any Price
                        </option>
                        <option value="0-2000000" className="bg-gray-900">
                            Under LKR 2M
                        </option>
                        <option value="2000000-5000000" className="bg-gray-900">
                            LKR 2M - 5M
                        </option>
                        <option value="5000000-10000000" className="bg-gray-900">
                            LKR 5M - 10M
                        </option>
                        <option value="10000000-" className="bg-gray-900">
                            Over LKR 10M
                        </option>
                    </select>
                </div>

                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
                    >
                        Search Cars
                    </button>
                </div>
            </form>
        </div>
    )
}

export default HomeSearchForm
