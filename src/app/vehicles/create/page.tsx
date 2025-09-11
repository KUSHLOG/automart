import { auth } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import CreateVehicleForm from '@/components/CreateVehicleForm'

export default async function CreateVehiclePage() {
  const session = await auth()

  if (!session) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Black Background - Same as other pages */}
      <section className="relative bg-black text-white min-h-screen flex flex-col w-full">
        {/* Background Pattern/Texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 w-full"></div>

        {/* Content - Centered and properly spaced */}
        <div className="relative flex-1 flex flex-col justify-center items-center w-full">
          {/* Hero Text - Consistent with other pages */}
          <div className="text-center mb-8 lg:mb-12 w-full px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              Create Vehicle Listing
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 lg:mb-8 max-w-4xl mx-auto">
              Add your vehicle to Auto Mart marketplace
            </p>
          </div>

          {/* Form Container - Full width edge to edge */}
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-8 border border-white/20 max-w-6xl mx-auto">
              <CreateVehicleForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
