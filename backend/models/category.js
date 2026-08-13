// _id 
// name
// slug (в контроллере сделать проверку если передали slug - не формировать, иначе собирать с формате ру буква -> en буква)


const emailSchema = Joi.string().email();

const personSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        validate: {
            validator: (value) => !emailSchema.validate(value).error,
            message: (props) => `${props.value} - некорректный email`
        }
    }
})