export type RegisterPayload = {
    nama: string;
    email: string;
    password: string;
};

export const validateRegisterForm = ({
    password,
    confirmPassword,
}: {
    password: string;
    confirmPassword: string;
}): string | null => {
    if (password !== confirmPassword) {
        return 'Kata sandi dan konfirmasi kata sandi tidak cocok!';
    }

    if (password.length < 6) {
        return 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter.';
    }

    return null;
};

export const getFriendlyErrorMessage = (error: unknown, responseStatus?: number): string => {
    const message = typeof error === 'object' && error !== null ? (error as { message?: string; name?: string; error?: string }).message : undefined;
    const errorName = typeof error === 'object' && error !== null ? (error as { name?: string }).name : undefined;
    const errorDetail = typeof error === 'object' && error !== null ? (error as { error?: string }).error : undefined;

    if (responseStatus === 400 || responseStatus === 409) {
        if (errorDetail && errorDetail.includes('required')) {
            return 'Silakan lengkapi semua field pendaftaran.';
        }
        return 'Email sudah terdaftar atau data tidak valid. Silakan periksa kembali.';
    }

    if (responseStatus === 422) {
        return 'Format data yang dimasukkan belum sesuai. Periksa kembali nama dan email Anda.';
    }

    if (responseStatus && responseStatus >= 500) {
        return 'Terjadi masalah pada server kami. Silakan coba beberapa saat lagi.';
    }

    if (errorName === 'TypeError' || (typeof message === 'string' && message.includes('Failed to fetch'))) {
        return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    }

    return message || 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
};

export async function registerUser(payload: RegisterPayload) {
    const response = await fetch('https://momo-be-production.up.railway.app/api/v1/guru/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    return { response, data };
}
