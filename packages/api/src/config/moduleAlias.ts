import moduleAlias from "module-alias";
import path from "path";

const basePath = process.env.NODE_ENV === "production" ? "dist" : "src";
moduleAlias.addAliases({
	"@": path.join(process.cwd(), basePath),
	"generated": path.join(process.cwd(), "generated"),
});
