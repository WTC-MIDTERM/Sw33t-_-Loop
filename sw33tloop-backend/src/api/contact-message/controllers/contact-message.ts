
import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::contact-message.contact-message',
  () => ({
    async find(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can view contact messages.');
      }
      return super.find(ctx);
    },

    async findOne(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can view contact messages.');
      }
      return super.findOne(ctx);
    },
  })
);