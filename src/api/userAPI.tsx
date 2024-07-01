import type {User} from "@/types/user";

export const getSelfFn = async (): Promise<User> => {
    return await fetch('/api/auth/self', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    }).then(res => {
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error("Помилка отримання профілю користувача", {
                cause: res
            });
        }
    });
};

export interface IChangePassword {
    oldPassword: string
    newPassword: string
}

export const changePasswordFn = async (data: IChangePassword) => {
    return await fetch('/api/auth/password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    }).then(res => {
        if (res.status === 200) {
            return res.json();
        } else {
            throw new Error("Помилка зміни пароля користувача", {
                cause: res
            });
        }
    });
}