import { apiClient } from '@/api/client/route';

interface HealthResponse {
    status: string;
    message: string;
}

async function getHealthStatus(): Promise<HealthResponse> {
    try {
        const response = await apiClient.get<HealthResponse>('/health');
        return response.data;
    } catch (error) {
        console.error('Gagal mengecek status backend:', error);
        return { status: 'error', message: 'Server Offline' };
    }
}

export default async function Page() {
    const health = await getHealthStatus();

    // Tentukan warna berdasarkan status (case-insensitive)
    const isOk = health.status.toLowerCase() === 'ok';
    const statusColorClass = isOk ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-gray-800 min-h-[calc(100dvh-5rem)] w-full text-white flex items-center justify-center overflow-x-hidden relative select-none">
            <main className="flex flex-col gap-2 md:text-2xl">
                <h1 className="text-yellow-500 font-bold">Status Backend</h1>
                <p>
                    Status: <span className={`font-semibold ${statusColorClass}`}>{health.status}</span>
                </p>
                <p>Pesan: {health.message}</p>
            </main>
        </div>
    );
}