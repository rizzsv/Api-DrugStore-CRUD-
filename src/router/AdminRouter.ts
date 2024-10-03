import { Router } from "express";
import {authentication, createAdmin, deleteAdmin, readAdmin, updateAdmin} from "../controller/AdminController"
import {createValidation, updateValidation, deleteValidation, authValidation} from "../middleware/Admin.validation"
import { verifyToken } from "../middleware/Authorization";
const router = Router();

router.post (`/`,[verifyToken], [createValidation], createAdmin)

router.get(`/`, readAdmin)

router.put(`/:id`, [verifyToken], [updateValidation], updateAdmin)

router.delete(`/:id`, [verifyToken], [deleteValidation], deleteAdmin)

router.post(`/auth`,  authentication)

export default router