export default function AuthLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-10 opacity-50">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply animate-pulse" />
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-2000" />
                    <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply animate-pulse animation-delay-4000" />
                </div>
            </div>

            {/* Loading Content */}
            <div className="relative z-10 text-center">
                <div className="mb-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">Signing you in...</h2>
                    <p className="text-gray-300">Please wait while we authenticate your account.</p>
                </div>

                {/* Voltaic Logo/Brand */}
                <div className="mt-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Voltaic
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">AI-Powered MVP Generator</p>
                </div>
            </div>
        </div>
    );
} 