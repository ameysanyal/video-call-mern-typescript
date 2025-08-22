import { Request, Response, NextFunction } from 'express';

type AsyncControllerType = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler =
  (controller: AsyncControllerType): AsyncControllerType =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

//In an async function, even without a return statement,
//the function implicitly returns a Promise<void> (i.e., a resolved promise with undefined).”
