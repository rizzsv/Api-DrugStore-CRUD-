import { request, Request, response, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { error } from "console";
import path from "path";
import fs from "fs";
import { ROOT_DIRECTORY } from "../config";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient({errorFormat:"minimal"})

/** schema create */
const createAdmin = async (
    req: Request,
    res: Response,
) => {
    try{
        const username: string = req.body.username
        const email: string = req.body.email
        const password: string = req.body.password

        const findEmail = await prisma.admin.findFirst({where: {email}})
        if (findEmail){
            return res.status(400).json({ message: "email has exist "})
        }
        const hashPassword = await bcrypt.hash(password, 12)

        const newAdmin = await prisma.admin.create({
            data: {
                username,
                email,
                password: hashPassword
            }
        });

        return res.status(200).json({
            message: "new admin has been created",
            data: newAdmin
        })
    }catch(err){
        console.log(err);

        return res.status(500).json({ error: err })
    }
}

const readAdmin = async (
    req: Request,
    res: Response,
) => {
    try {
        const search = req.query.search
        const allAdmin = await prisma.admin.findMany({
            where: {
                OR: [
                    {username: {contains: search?.toString() || ""}},                                     
               ]
            }
        })
        return res.status(200).json({
            message: `admin has been retri`,
            data: allAdmin
        })
    }catch(err){
        console.log(err)
        res.status(500).json({ error: err })
    }
}

const updateAdmin = async (
    req: Request,
    res: Response,
) => {
    try{
        const id = req.params.id

        const findAdmin = await prisma.admin.findFirst({
            where: {id: Number(id)}
        })

        if(!findAdmin) {
            return res.status(200).json ({
                message: `admin not found`
            })
        }

        const {username,email,password} = req.body

        const saveAdmin = await prisma.admin.update({
            where: {id: Number(id)},
            data: {
                username: username ?? findAdmin.username,
                email: email ?? findAdmin.email,
                password: password ?? findAdmin.password
            }
        })
        
        return res.status(200).json({
            message: `Admin has been updated`,
            data: saveAdmin
        })
    }catch(err){
        return res.status(500).json({ error: err })
    }
}

const deleteAdmin = async (
    req: Request,
    res: Response
) => {
    try{
        const id = req.params.id

        const findAdmin = await prisma.admin.findFirst({
            where: {
                id: Number(id)
            }
        })

        if(!findAdmin) {
            return res.status(200).json({message: `admin is not found`})
        }

        const saveAdmin = await prisma.admin.delete({
            where: {id: Number(id)}
        })

        return res.status(200).json ({
            message: `admin has been removed`,
            data: saveAdmin
        })
    }catch(err){
        return res.status(500).json({
            error: err
        })
    }
}

/** function for login (authentication) */
const authentication = async (
    req: Request,
    res: Response
) => {
    try {
        const {email, password} = req.body
        /** check existing email */
        const findAdmin = await prisma.admin.findFirst({
            where: { email }
        })

        if(!findAdmin){
            return res.status(200).json({
                message: `email is not registered`
            })
        }

        const isMatchPassword = await bcrypt.compare(password, findAdmin.password)

        if(!isMatchPassword){
            return res.status(200).json({
                message: `invalid password`
            })
        }

        /** prepare to generate token using jwt */
        const payload = {
            name: findAdmin.username,
            email: findAdmin.email
        }
        const signature = process.env.SECRET || ``

        const token = jwt.sign(payload, signature)

        return res.status(200).json({
            logged: true,
            token,
            id: findAdmin.id,
            name: findAdmin.username,
            email: findAdmin.email
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}
export { createAdmin, readAdmin, updateAdmin, deleteAdmin, authentication }