export const findOne = async ({ model, filter = {}, select = "" } = {}) => {
    return await model.findOne(filter).select(select);
};

export const findById = async ({ model, id, select = "" } = {}) => {
    return await model.findById(id).select(select);
};

export const create = async ({ model, data = [{}], option = {} } = {}) => {
    return await model.create(data, option);
};

export const updateOne = async ({
    model,
    filter = {},
    data = {},
    option = { runValidation: true },
} = {}) => {
    return await model.updateOne(filter, data, option);
};

export const findOneAndUpdate = async ({
    model,
    filter = {},
    data = {},
    select = "",
    option = { runValidation: true, new: true },
} = {}) => {
    return await model
        .findOneAndUpdate(filter, { ...data, $inc: { __v: 1 } }, option)
        .select();
};



export const deleteOne = async ({
    model,
    filter = {},
} = {}) => {
    return await model.deleteOne(filter)
};

