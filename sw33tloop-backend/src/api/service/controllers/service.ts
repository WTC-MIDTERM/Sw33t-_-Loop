/**
 * service controller
 *
 * Path: src/api/service/controllers/service.ts
 *
 * Anyone can browse services (find/findOne), but only admins can
 * create, update, or delete them from the storefront admin dashboard.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::service.service',
  () => ({
    async create(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can create services.');
      }
      return super.create(ctx);
    },

    async update(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can update services.');
      }
      return super.update(ctx);
    },

    async delete(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can delete services.');
      }
      return super.delete(ctx);
    },
  })
);