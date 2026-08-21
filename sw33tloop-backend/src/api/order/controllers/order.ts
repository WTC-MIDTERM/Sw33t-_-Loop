/**
 * order controller
 *
 * Path: src/api/order/controllers/order.ts
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::order.order',
  ({ strapi }: { strapi: any }) => ({
    // Admins see every order. Regular customers only see their own.
    async find(ctx: any) {
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in to view orders.');
      }

      if (!ctx.state.user.isAdmin) {
        ctx.query = {
          ...ctx.query,
          filters: {
            ...ctx.query.filters,
            users_permissions_user: ctx.state.user.id,
          },
        };
      }

      return super.find(ctx);
    },

    // Same rule for a single order: admins can view any, customers only their own
    async findOne(ctx: any) {
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in to view this order.');
      }

      const { id } = ctx.params;
      const order: any = await strapi.entityService.findOne('api::order.order', id, {
        populate: ['users_permissions_user'],
      });

      const isOwnOrder = order?.users_permissions_user?.id === ctx.state.user.id;

      if (!order || (!ctx.state.user.isAdmin && !isOwnOrder)) {
        return ctx.notFound('Order not found.');
      }

      return super.findOne(ctx);
    },

    // Auto-attach the logged-in user to every new order -- the client
    // never gets to choose whose account an order belongs to
    async create(ctx: any) {
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in to place an order.');
      }

      ctx.request.body.data = {
        ...ctx.request.body.data,
        users_permissions_user: ctx.state.user.id,
      };

      return super.create(ctx);
    },

    // Only admins can update an order (e.g. changing its status)
    async update(ctx: any) {
      if (!ctx.state.user?.isAdmin) {
        return ctx.forbidden('Only admins can update orders.');
      }

      return super.update(ctx);
    },
  })
);