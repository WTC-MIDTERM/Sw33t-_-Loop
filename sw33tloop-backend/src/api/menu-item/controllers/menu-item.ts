
import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::menu-item.menu-item',
  () => ({
    async create(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can create menu items.');
      }
      return super.create(ctx);
    },

    async update(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can update menu items.');
      }
      return super.update(ctx);
    },

    async delete(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can delete menu items.');
      }
      return super.delete(ctx);
    },
  })
);