import { auth } from '@/server/auth/auth'
import { redirect } from 'next/navigation'

export default async function CreateVehiclePage() {
  const session = await auth()

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Vehicle Listing</h1>
            <p className="text-gray-300">Add your vehicle to Auto Mart</p>
          </div>

          <form className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-300 mb-2">
                  Mileage (km)
                </label>
                <input
                  id="mileage"
                  name="mileage"
                  type="number"
                  min="0"
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="50000"
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
                  <option value="LIVE_AUCTION">Live Auction</option>
                </select>
              </div>
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
              <label htmlFor="images" className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Images
              </label>
              <input
                id="images"
                name="images"
                type="file"
                multiple
                accept="image/*"
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">Upload up to 10 images (max 5MB each)</p>
            </div>

            {/* Vehicle Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="engine" className="block text-sm font-medium text-gray-300 mb-2">
                  Engine
                </label>
                <input
                  id="engine"
                  name="engine"
                  type="text"
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="2.0L Turbo"
                />
              </div>

              <div>
                <label
                  htmlFor="transmission"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Transmission
                </label>
                <select
                  id="transmission"
                  name="transmission"
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div>
                <label htmlFor="fuel" className="block text-sm font-medium text-gray-300 mb-2">
                  Fuel Type
                </label>
                <select
                  id="fuel"
                  name="fuel"
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
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
                onClick={() => window.history.back()}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
