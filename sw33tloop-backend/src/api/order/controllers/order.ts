/**
 * order controller
 *
 * Path: src/api/order/controllers/order.ts
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::order.order',
  ({ strapi }: { strapi: any }) => ({
    // Only return orders belonging to the logged-in user
    async find(ctx: any) {
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in to view orders.');
      }

      ctx.query = {
        ...ctx.query,
        filters: {
          ...ctx.query.filters,
          user: ctx.state.user.id,
        },
      };

      return super.find(ctx);
    },

    // Same restriction for fetching a single order by id
    async findOne(ctx: any) {
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in to view this order.');
      }

      const { id } = ctx.params;
      const order: any = await strapi.entityService.findOne('api::order.order', id, {
        populate: ['user'],
      });

      if (!order || order.user?.id !== ctx.state.user.id) {
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
        user: ctx.state.user.id,
      };

      return super.create(ctx);
    },
  })
);