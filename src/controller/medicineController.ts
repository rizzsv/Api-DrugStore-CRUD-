import { Request, Response } from "express";
import { DrugType, PrismaClient } from "@prisma/client"

/** create object of prisma */
const prisma = new PrismaClient()
type DrugType = "Syrup" | "Tablet" | "Powder"

const createMedicine = async (req: Request, res: Response) => {
    try{
        const name: string = req.body.name
        const stock: number = Number(req.body.stock)
        const exp_date: Date = new Date(req.body.exp_date)
        const price: Number = Number(req.body.price)
        const type: DrugType = req.body.type
        
        //** SAEVE A NEW MEDICANE TO DB*/
        const newMedicine = await prisma.medicine.create({
            data: {
                name, stock exp_date price type as DrugType
            }
        }) 
        return res.status(200).json({
            messagae: "new medicine has been created",
            date: newMedicine
        })
    }catch(erorr){ 
        return res.status(500).json(erorr)
    }
}

export { createMedicine }