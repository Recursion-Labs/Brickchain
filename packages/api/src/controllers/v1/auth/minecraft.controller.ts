import { db } from "@/config/database";
import catchAsync from "@/handlers/async.handler";
import { APIError } from "@/utils/APIerror";
import { Request, Response } from "express";

const login = catchAsync(async (req: Request, res: Response) => {
    const { token, minecraftPlayerData } = req.body;
    if (!token) {
        throw new APIError(400, "Token is required");
    }
    if (!minecraftPlayerData || !minecraftPlayerData.id) {
        throw new APIError(400, "Minecraft player data with id is required");
    }
    console.log(req.body)
    // Check if user exists with the token
    let user = await db.user.findFirst({
        where: {
            minecraftAuthToken: token
        }
    });

    if (!user) {
        // Create new user account
        const playerId = minecraftPlayerData.id;
        const email = `${playerId}@minecraft.local`; // Generate unique email

        user = await db.user.create({
            data: {
                email,
                minecraftAuthToken: token,
                minecraftPlayerData,
                name: minecraftPlayerData.name || `Player_${playerId}`,
            }
        });
    } else {
        // If user exists but has no minecraftPlayerData, update it
        if (!user.minecraftPlayerData) {
            user = await db.user.update({
                where: { id: user.id },
                data: { minecraftPlayerData }
            });
        }
    }

    res.status(200).json({
        success: true,
        message: "Minecraft authentication successful",
        data: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            minecraftPlayerData: user.minecraftPlayerData,
        }
    });
    return;
});

export default {
    login
}