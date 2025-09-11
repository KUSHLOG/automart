'use client'

import { useRouter } from 'next/navigation'

export default function CreateVehicleForm() {
    const router = useRouter()

    const handleCancel = () => {
        router.back()
    }

    return (
        <form className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-300 mb-2">
                        Make *
                    </label>
                    <input
                        id="make"
                        name="make"
                        type="text"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Toyota, Honda, BMW"
                    />
                </div>

                <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
                        Model *
                    </label>
                    <input
                        id="model"
                        name="model"
                        type="text"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Camry, Civic, X5"
                    />
                </div>

                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                        Year *
                    </label>
                    <input
                        id="year"
                        name="year"
                        type="number"
                        min="1900"
                        max="2030"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="2020"
                    />
                </div>
            </div>

            {/* Pricing and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                        Price (LKR) *
                    </label>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="1000"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="2500000"
                    />
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                        Listing Type *
                    </label>
                    <select
                        id="type"
                        name="type"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select type</option>
                        <option value="BUY_NOW">Buy Now</option>
                        <option value="BIDDING">Bidding</option>
                    </select>
                </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-300 mb-2">
                        Mileage (km) *
                    </label>
                    <input
                        id="mileage"
                        name="mileage"
                        type="number"
                        min="0"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="50000"
                    />
                </div>

                <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
                        Color *
                    </label>
                    <input
                        id="color"
                        name="color"
                        type="text"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., White, Black, Silver"
                    />
                </div>

                <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-300 mb-2">
                        Condition *
                    </label>
                    <select
                        id="condition"
                        name="condition"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select condition</option>
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                        <option value="Certified Pre-owned">Certified Pre-owned</option>
                    </select>
                </div>
            </div>

            {/* Vehicle Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="fuelType" className="block text-sm font-medium text-gray-300 mb-2">
                        Fuel Type *
                    </label>
                    <select
                        id="fuelType"
                        name="fuelType"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select fuel type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="transmission" className="block text-sm font-medium text-gray-300 mb-2">
                        Transmission *
                    </label>
                    <select
                        id="transmission"
                        name="transmission"
                        required
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select transmission</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                        <option value="CVT">CVT</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="engineSize" className="block text-sm font-medium text-gray-300 mb-2">
                        Engine Size
                    </label>
                    <input
                        id="engineSize"
                        name="engineSize"
                        type="text"
                        className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., 2.0L, 1500cc"
                    />
                </div>
            </div>

            {/* Body Type */}
            <div>
                <label htmlFor="bodyType" className="block text-sm font-medium text-gray-300 mb-2">
                    Body Type *
                </label>
                <select
                    id="bodyType"
                    name="bodyType"
                    required
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                    <option value="">Select body type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Wagon">Wagon</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Van">Van</option>
                </select>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Describe your vehicle's condition, features, and any other relevant details..."
                />
            </div>

            {/* Image Upload */}
            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    Vehicle Image URL *
                </label>
                <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    required
                    className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/vehicle-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-2">Provide a URL to your vehicle image</p>
            </div>

            {/* Vehicle Features/Specs */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                    Vehicle Features (Optional)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="airConditioning" className="rounded" />
                        <span>Air Conditioning</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="leatherSeats" className="rounded" />
                        <span>Leather Seats</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="sunroof" className="rounded" />
                        <span>Sunroof</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="navigationSystem" className="rounded" />
                        <span>Navigation System</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="parkingAssist" className="rounded" />
                        <span>Parking Assist</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="cruiseControl" className="rounded" />
                        <span>Cruise Control</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="powerSteering" className="rounded" />
                        <span>Power Steering</span>
                    </label>
                    <label className="flex items-center space-x-2 text-gray-300">
                        <input type="checkbox" name="abs" className="rounded" />
                        <span>ABS</span>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                    Create Listing
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
