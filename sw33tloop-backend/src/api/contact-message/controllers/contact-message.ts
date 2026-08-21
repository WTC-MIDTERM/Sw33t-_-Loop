/**
 * contact-message controller
 *
 * Path: src/api/contact-message/controllers/contact-message.ts
 *
 * Anyone can submit a message (create), but only admins can read them
 * back -- contact messages have no owner/user relation, so this is an
 * admin-only visibility rule rather than an "ownership" rule.
 */

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